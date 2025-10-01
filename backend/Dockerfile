FROM golang:1.25

RUN mkdir /__tmp

# Set the working directory inside the container
WORKDIR /app
#  Download air for live reload in go environment
RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./

RUN go mod download

COPY . .

CMD ["air", "-c", ".air.toml"]

# CLI: docker run --rm -it backend-mayra-jewelry /bin/sh || docker compse up --build
