FROM golang:1.25

# Set the working directory inside the container
WORKDIR /app

#  Download air for live reload in go environment
RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./

RUN go mod download

COPY . .

CMD ["air", "-c", ".air.toml"]
