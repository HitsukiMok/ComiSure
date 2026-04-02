FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl tar build-essential && rm -rf /var/lib/apt/lists/*

# Install Stellar CLI v25.2.0 (must match the testnet protocol version)
RUN curl -sSL https://github.com/stellar/stellar-cli/releases/download/v25.2.0/stellar-cli-25.2.0-x86_64-unknown-linux-gnu.tar.gz -o stellar-cli.tar.gz \
    && tar -xzf stellar-cli.tar.gz \
    && mv stellar /usr/local/bin/stellar || mv stellar-cli-25.2.0-x86_64-unknown-linux-gnu/stellar /usr/local/bin/stellar || true \
    && chmod +x /usr/local/bin/stellar \
    && rm -rf stellar-cli.tar.gz stellar-cli-* \
    && stellar --version

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files and pre-compiled smart contract
COPY . .

# Expose standard port and boot Uvicorn
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
