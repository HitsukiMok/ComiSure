FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl tar build-essential && rm -rf /var/lib/apt/lists/*

# Install the Stellar CLI binary natively for the backend automation script
RUN curl -sSL https://github.com/stellar/stellar-cli/releases/download/v22.0.0/stellar-cli-22.0.0-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /usr/local/bin

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files and pre-compiled smart contract
COPY . .

# Expose standard port and boot Uvicorn
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
