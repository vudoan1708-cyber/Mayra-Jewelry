package cloudflare

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
	"github.com/vudoan1708-cyber/Mayra-Jewelry/backend/mayra-jewelry/helpers"
)

type CloudflareProxy interface {
	Init()
	GetPresignedUrl() (string, error)
	GetImage()
	CreateImage() error
}

type Cloudflare struct {
	__s3         *s3.Client
	PresignedUrl string `json:"presignedUrl"`
	BucketName   string `json:"bucketName"`
}

var once sync.Once

// Reference: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-go/
func (cf *Cloudflare) Init() (*Cloudflare, error) {
	var init_error error = nil

	once.Do(func() {
		accountId := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
		accessKey := os.Getenv("CLOUDFLARE_ACCESS_KEY")
		accessKeySecret := os.Getenv("CLOUDFLARE_SECRET_KEY")

		cf.BucketName = os.Getenv("CLOUDFLARE_BUCKET_NAME")

		configObj, err := config.LoadDefaultConfig(
			context.TODO(),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, accessKeySecret, "")),
			config.WithRegion("auto"),
		)
		if err != nil {
			init_error = fmt.Errorf("cannot connect to Cloudflare: %e", err)
		}

		cf.__s3 = s3.NewFromConfig(configObj, func(option *s3.Options) {
			option.BaseEndpoint = aws.String((fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId)))
		})
	})
	return cf, init_error
}

type Procedure string

const (
	GET Procedure = "GET"
	PUT Procedure = "PUT"
)

type PresignedUrlPayload struct {
	FileName  string    `json:"fileName"`
	FileType  *string   `json:"fileType"`
	Procedure Procedure `json:"procedure"`
}

var actionByProcedure = map[Procedure]func(presignClient *s3.PresignClient, bucketName string, payload PresignedUrlPayload) (*string, error){
	GET: func(presignClient *s3.PresignClient, bucketName string, payload PresignedUrlPayload) (*string, error) {
		presignResult, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(payload.FileName),
		})
		if err != nil {
			return nil, fmt.Errorf("couldn't get presigned URL for GetObject")
		}

		return &presignResult.URL, nil
	},
	PUT: func(presignClient *s3.PresignClient, bucketName string, payload PresignedUrlPayload) (*string, error) {
		presignResult, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(payload.FileName),
			ContentType: payload.FileType,
		})
		if err != nil {
			var apiErr smithy.APIError
			if errors.As(err, &apiErr) && apiErr.ErrorCode() == "EntityTooLarge" {
				return nil, fmt.Errorf("error while uploading object to %s. The object is too large..."+
					"To upload objects larger than 5GB, use the S3 console (160GB max)"+
					"or the multipart upload API (5TB max)", bucketName)
			}
			return nil, fmt.Errorf("couldn't get presigned URL for PutObject")
		}

		return &presignResult.URL, nil
	},
}

func (cf *Cloudflare) GetPresignedUrl(bucketName string, payload PresignedUrlPayload) (*string, error) {
	if cf.__s3 == nil {
		return nil, fmt.Errorf("s3 client has not been instantiated. Please consider using Init()")
	}

	presignClient := s3.NewPresignClient(cf.__s3)
	presignedUrl, err := actionByProcedure[payload.Procedure](presignClient, bucketName, payload)

	if err != nil {
		return nil, err
	}

	cf.PresignedUrl = *presignedUrl
	return presignedUrl, nil
}

func (cf *Cloudflare) ListObjectsInBucket(bucketName string, prefix *string) ([]types.Object, error) {
	objects, err := cf.__s3.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(bucketName),
		Prefix: helpers.FalsyFallback(prefix, nil),
	})
	if err != nil {
		return nil, fmt.Errorf("%s | bucket is: %s", err, bucketName)
	}
	if len(objects.Contents) == 0 {
		return nil, fmt.Errorf("bucket %s might be empty", bucketName)
	}

	return objects.Contents, nil
}

// Instantiate the class once internally
var CloudflareInstance = &Cloudflare{}
