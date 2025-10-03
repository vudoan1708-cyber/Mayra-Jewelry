FROM golang:1.25

# Set the working directory inside the container
WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

CMD ["go", "run", "."]

# CLI: docker run --rm -it backend-mayra-jewelry /bin/sh || docker compse up --build
