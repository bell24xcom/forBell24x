# Bell24H SSL Setup - Direct SSH Execution
# This script automatically connects to your Oracle VM and sets up HTTPS

$ErrorActionPreference = "Stop"

$SSH_KEY = "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
$VM_USER = "ubuntu"
$VM_IP = "80.225.192.248"

Write-Host "[SSL SETUP] Bell24H SSL Setup - Automated Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "[ERROR] SSH key not found at: $SSH_KEY" -ForegroundColor Red
    Write-Host "Please update the SSH_KEY path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "[CONNECTING] Connecting to VM and setting up SSL..." -ForegroundColor Yellow
Write-Host "   Target: $VM_USER@$VM_IP" -ForegroundColor Gray
Write-Host ""

# Execute all commands in one SSH session
$sshCommand = @'
set -e
echo "🔐 Starting Bell24H SSL Setup..."

# Create SSL directory
echo "📁 Creating SSL directory..."
sudo mkdir -p /etc/ssl/certs/cloudflare

# Save certificate
echo "💾 Saving certificate..."
sudo tee /etc/ssl/certs/cloudflare/origin.crt > /dev/null <<'CERT_EOF'
-----BEGIN CERTIFICATE-----

MIIEojCCA4qgAwIBAgIUHN7pKLxE6OZ0W2KSnO9JgNEfSUgwDQYJKoZIhvcNAQEL

BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw

MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y

aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh

MB4XDTI1MTExNDE5MjUwMFoXDTQwMTExMDE5MjUwMFowYjEZMBcGA1UEChMQQ2xv

dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk

BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG

9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmJgTufEDCEpL4JBGduX/r5DrsjTbOk8IFrQD

yRU9RAGiLf/XFjy3+L/zJlheYHINbhITh19JgVJSILbf6sUlCaM4TNQ+eN1XSbBU

IqpgVSWFh1OGHVYyEl5ad4CbpOC29PSU1d1VWjKv+u28svDwtfH6z63jw9DLkN7B

0HnsA8Iqu/0e2E9IgAyFrL635JIf+j+wAkX+mJIUjamlTuLE6iETyiWwNd260q4r

XdJwO3omyK1nBWk1KBnqprviRiG1zfpWQMeV9ifrV6eLGXGseI8fYOYqqmS5cFt2

o0sqPBhNUx2PvY6aNk+kor/G3O9qTtWIiC2het3hBnHTLzFEJQIDAQABo4IBJDCC

ASAwDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD

ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBSllgI7H0Cb3M1Z2E4kgHSRfBdd7TAf

BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw

MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j

YTAlBgNVHREEHjAcgg0qLmJlbGwyNGguY29tggtiZWxsMjRoLmNvbTA4BgNVHR8E

MTAvMC2gK6AphidodHRwOi8vY3JsLmNsb3VkZmxhcmUuY29tL29yaWdpbl9jYS5j

cmwwDQYJKoZIhvcNAQELBQADggEBAJm5Sfb8MEQz8E4Y46bmmsjbd1tB1hEwNE/Q

7IWkuxOyI7Oe9fL6pg334OgKJnuKVY72iuLjYDByN1dnLz33/NbP4uC9sLWDCpUz

h7T+DUEMOQEmxSDcooToljDJuMtiBRA6A+sYJCYHkcIbWDJHlZJdbJmdBfEr7kzN

WDiJz9japGkY/pgTQNeyK2GWmxsZ4AmTFeKTXJvOr9g7U1EBYaObqWJT/2Vw9gXr

r/zrUvrXsIdC0UA46i7eVX/dA8KzgOvg4wR2yseHHIua/6jtUWpfhjl1pl3c3ie8

eBqgL5OBKOK0P/68D2WksIbA2vXcXidNS/wSC2p+69YXi5fDzhE=

-----END CERTIFICATE-----
CERT_EOF

# Save private key
echo "🔑 Saving private key..."
sudo tee /etc/ssl/certs/cloudflare/origin.key > /dev/null <<'KEY_EOF'
-----BEGIN PRIVATE KEY-----

MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCYmBO58QMISkvg

kEZ25f+vkOuyNNs6TwgWtAPJFT1EAaIt/9cWPLf4v/MmWF5gcg1uEhOHX0mBUlIg

tt/qxSUJozhM1D543VdJsFQiqmBVJYWHU4YdVjISXlp3gJuk4Lb09JTV3VVaMq/6

7byy8PC18frPrePD0MuQ3sHQeewDwiq7/R7YT0iADIWsvrfkkh/6P7ACRf6YkhSN

qaVO4sTqIRPKJbA13brSritd0nA7eibIrWcFaTUoGeqmu+JGIbXN+lZAx5X2J+tX

p4sZcax4jx9g5iqqZLlwW3ajSyo8GE1THY+9jpo2T6Siv8bc72pO1YiILaF63eEG

cdMvMUQlAgMBAAECggEAApwqPBQx0x3o4Ioi8VhJb1Zc8Bj0e2TwVYNYQ8OqeKLQ

QAj4iCV5IH9kinjuRjDFwMSFhIYlnfL0A+7ETR2rzZvDqWUFtTIhm1DksAzWlun7

SOCDFrZewIyuALiJuYaa2XSfPrHjCo1IQ37dCQpf6pO25eYEKK6S4qmRioBL5qip

0h6m+GWOz9RWcEf68ABTFojTklfV18yZCj4eSA6I+wkjpE7AEjtYa6GRSDNQc7sm

DuV7bDcAg41NkX4hWMvslaYsJtB6ZKomGu293FOJUeLKWOauCt64QsGZlVamm/U1

4fmoDxyTMLuX0X/AMppGzCWqFEfuuKx4jcnQpUFLUwKBgQDOEym8L7yFM3DFKhLz

2iaiOl3WUSKdB1OqcQOelhAQpLcUUGFOItyDGsJ2ja1euHmg16Ja3+oz1158fG4b

Ld7sSjIj8gfU7DevxLJqoaiKsIyzO/p6AQKOzPzxRUtDlIvAx+PDkuausNrgnR9b

2Ye5TushR7OtUf6HfPOqDF1A2wKBgQC9kAPk9SvVJ0XrxoREmr0AHW28YCmmPT77

7WJz0IBvalR9f0PfxJeqlLNXK/O+JwFNWQU4M1hdgV89FLr6Lv+Uto83ilcgXiNV

pPFWl6MPHEMTQ0u98wMp1jL38vPodtrpAh249cOoz7g5Me5BoJXz0Qv18eupKP0I

OOgYhlwe/wKBgAYD5y74Eb+tnbgTn1QA5SnNHFoaKjF9OkL6Y4mohbWGqVVtdzmp

qNgm2tBNGGdwaRR51uJiMNrsiXSGyUv/zccF72q/MN1VO9bknfSg3WOW/bRppskS

6Hk0oJmGVUkWt/GbpBlcW2F0Bh+SVoz+z4hoNlLVXfhMMWrRCefHzp0LAoGAUEkn

rRg9yViJ37NDn/7dn6fXK1qbKUJ1Y6QF98FONGIXiNOW/rY3+lJipsAByv6gKY9T

i5sLiQbbPHaEPqQbMXQkskRQZHAajRJ/+MnekO7KZeUxtjCvnU+QZL2smj+Etf1k

c0r75IqdnvPL0lXeTNa0NyWQRyQKDypy+rglWicCgYAvdSm6rDn2aQXMEQFtjhjY

3QPvOFGtSIwFA+T/CYqsvvma7cA3jxJjlTDgrWFjIJwXC9y4V09oDcNVI6W0jiFy

+QpUc8Gd1KaFDxbfsoC2cnIU1Z1GC0p60q9++3GWhpjfP4qY6jxxMHUBY60aH+dJ

hTImmf/tYzcUXuRcExbM5A==

-----END PRIVATE KEY-----
KEY_EOF

# Set permissions
echo "🔒 Setting permissions..."
sudo chmod 600 /etc/ssl/certs/cloudflare/origin.key
sudo chmod 644 /etc/ssl/certs/cloudflare/origin.crt

# Update bell24h Nginx config
echo "⚙️  Updating bell24h Nginx config..."
sudo tee /etc/nginx/sites-available/bell24h > /dev/null <<'NGINX_BELL24H'
# HTTPS Server Block (Port 443)
server {
    listen 443 ssl;
    server_name bell24h.com www.bell24h.com app.bell24h.com;

    ssl_certificate /etc/ssl/certs/cloudflare/origin.crt;
    ssl_certificate_key /etc/ssl/certs/cloudflare/origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP Server Block (Port 80) - Redirect to HTTPS
server {
    listen 80;
    server_name bell24h.com www.bell24h.com app.bell24h.com;
    return 301 https://$host$request_uri;
}
NGINX_BELL24H

# Update n8n Nginx config
echo "⚙️  Updating n8n Nginx config..."
sudo tee /etc/nginx/sites-available/n8n > /dev/null <<'NGINX_N8N'
# HTTPS Server Block (Port 443)
server {
    listen 443 ssl;
    server_name n8n.bell24h.com;

    ssl_certificate /etc/ssl/certs/cloudflare/origin.crt;
    ssl_certificate_key /etc/ssl/certs/cloudflare/origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP Server Block (Port 80) - Redirect to HTTPS
server {
    listen 80;
    server_name n8n.bell24h.com;
    return 301 https://$host$request_uri;
}
NGINX_N8N

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid!"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "🎉 SSL Setup Complete!"
    echo ""
    echo "✅ Certificate installed"
    echo "✅ Private key installed"
    echo "✅ Nginx configured for HTTPS"
    echo "✅ Nginx reloaded"
    echo ""
    echo "🌐 Your sites should now be live at:"
    echo "   - https://bell24h.com"
    echo "   - https://www.bell24h.com"
    echo "   - https://app.bell24h.com"
    echo "   - https://n8n.bell24h.com"
    echo ""
    echo "🔒 All sites now have HTTPS with green lock!"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
'@

try {
    Write-Host "Executing setup commands..." -ForegroundColor Yellow
    Write-Host ""
    
    # Execute the SSH command
    $sshCommand | ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VM_USER@$VM_IP "bash -s"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] SSL Setup Completed Successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your sites are now live with HTTPS:" -ForegroundColor Cyan
        Write-Host "   - https://bell24h.com" -ForegroundColor White
        Write-Host "   - https://www.bell24h.com" -ForegroundColor White
        Write-Host "   - https://app.bell24h.com" -ForegroundColor White
        Write-Host "   - https://n8n.bell24h.com" -ForegroundColor White
        Write-Host ""
        Write-Host "[SUCCESS] All sites now have green lock SSL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Wait 30 seconds, then test in your browser." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "[ERROR] Setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

