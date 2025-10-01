package cloudflare

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
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
}

// Reference: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-go/
func (cf *Cloudflare) Init() (*Cloudflare, error) {
	accountId := os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	accessKey := os.Getenv("CLOUDFLARE_ACCESS_KEY")
	accessKeySecret := os.Getenv("CLOUDFLARE_SECRET_KEY")

	configObj, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, accessKeySecret, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("cannot connect to Cloudflare: %e", err)
	}

	cf.__s3 = s3.NewFromConfig(configObj, func(option *s3.Options) {
		option.BaseEndpoint = aws.String((fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId)))
	})
	return cf, nil
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

var actionByProcedure = map[Procedure]func(*s3.PresignClient, string, PresignedUrlPayload) (*string, error){
	GET: func(presignClient *s3.PresignClient, bucketName string, payload PresignedUrlPayload) (*string, error) {
		presignResult, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(payload.FileName),
		})
		if err != nil {
			return nil, fmt.Errorf("couldn't get presigned URL for GetObject")
		}

		fmt.Printf("Presigned URL for GET object: %s\n", presignResult.URL)
		return &presignResult.URL, nil
	},
	PUT: func(presignClient *s3.PresignClient, bucketName string, payload PresignedUrlPayload) (*string, error) {
		presignResult, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(payload.FileName),
			ContentType: payload.FileType,
			ACL:         types.ObjectCannedACLPublicRead,
		})
		if err != nil {
			return nil, fmt.Errorf("couldn't get presigned URL for PutObject")
		}

		fmt.Printf("Presigned URL for PUT object: %s\n", presignResult.URL)
		return &presignResult.URL, nil
	},
}

func (cf *Cloudflare) GetPresignedUrl(bucketName string, payload PresignedUrlPayload) (*string, error) {
	if cf.__s3 == nil {
		return nil, fmt.Errorf("s3 client has not been instantiated. Please consider using Init()")
	}
	if bucketName == "" {
		bucketName = os.Getenv("CLOUDFLARE_BUCKET_NAME")
	}

	presignClient := s3.NewPresignClient(cf.__s3)
	presignedUrl, err := actionByProcedure[payload.Procedure](presignClient, bucketName, payload)

	if err != nil {
		return nil, err
	}

	return presignedUrl, nil
}
