# Fix SSH Key Permission Denied Error

## ❌ **Error: Permission denied (publickey)**

The SSH key secret is configured, but GitHub Actions can't use it. This usually means the key format is incorrect.

---

## 🔍 **Common Causes**

1. **Missing BEGIN/END lines** - Key must include headers
2. **Extra spaces or characters** - Key must be exact
3. **Wrong key format** - Must be OpenSSH format
4. **Line breaks corrupted** - Key must preserve line structure

---

## ✅ **Step-by-Step Fix**

### **Step 1: Get the Key Correctly**

**Method A: Using PowerShell (Recommended)**

1. **Open PowerShell** (as Administrator if possible)

2. **Run this command**:
   ```powershell
   Get-Content "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" -Raw | Set-Clipboard
   ```

3. **This copies the ENTIRE key to clipboard** (preserves formatting)

**Method B: Using Notepad**

1. **Open the key file**:
   - Navigate to: `C:\Users\Sanika\Downloads\oracle-ssh-bell\`
   - Open: `ssh-key-2025-10-01.key` with Notepad

2. **Select All** (Ctrl+A)

3. **Copy** (Ctrl+C)

4. **Important**: Make sure you copied EVERYTHING including:
   - `-----BEGIN OPENSSH PRIVATE KEY-----` (first line)
   - All the encoded lines in the middle
   - `-----END OPENSSH PRIVATE KEY-----` (last line)

---

### **Step 2: Update the GitHub Secret**

1. **Go to GitHub Secrets**:
   - Visit: `https://github.com/digitex-erp/bell24h/settings/secrets/actions`

2. **Find `ORACLE_SSH_KEY`**:
   - Click the **pencil icon** (edit) next to `ORACLE_SSH_KEY`

3. **Delete the old value**:
   - Select all text in the "Secret" field
   - Delete it

4. **Paste the new key**:
   - Paste the key you just copied (from Step 1)
   - **Make sure there are NO extra spaces** at the beginning or end
   - **Make sure BEGIN and END lines are included**

5. **Update secret**:
   - Click **"Update secret"**

---

### **Step 3: Verify Key Format**

The key should look EXACTLY like this:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAIwAAAAdzc2gtcnNhAAABAQC...
(many lines of encoded text)
...
-----END OPENSSH PRIVATE KEY-----
```

**Important Checks:**
- ✅ Starts with `-----BEGIN OPENSSH PRIVATE KEY-----`
- ✅ Ends with `-----END OPENSSH PRIVATE KEY-----`
- ✅ No extra spaces before BEGIN
- ✅ No extra spaces after END
- ✅ All lines are preserved (no line breaks removed)

---

### **Step 4: Test the Key Locally**

Before re-running, test if the key works:

**In PowerShell:**
```powershell
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248 "echo 'SSH key works!'"
```

**If this works**, the key is correct and the issue is with how it's stored in GitHub.

**If this fails**, the key file itself might be corrupted or wrong.

---

### **Step 5: Alternative - Use Base64 Encoding**

If the key still doesn't work, try encoding it:

1. **Get the key content** (from Step 1)

2. **Encode to Base64** (PowerShell):
   ```powershell
   $key = Get-Content "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" -Raw
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($key)) | Set-Clipboard
   ```

3. **Update GitHub secret** with the Base64-encoded value

4. **Update workflow** to decode it (see below)

---

## 🔧 **Alternative Solution: Update Workflow**

If the key format is still causing issues, we can update the workflow to handle it better:

**Update `.github/workflows/deploy.yml`** to add key validation:

```yaml
- name: Setup SSH
  uses: webfactory/ssh-agent@v0.7.0
  with:
    ssh-private-key: ${{ secrets.ORACLE_SSH_KEY }}
  
- name: Verify SSH Key
  run: |
    echo "Checking SSH key format..."
    if [ -z "${{ secrets.ORACLE_SSH_KEY }}" ]; then
      echo "❌ SSH key is empty!"
      exit 1
    fi
    echo "✅ SSH key is present"
```

---

## 🎯 **Quick Checklist**

Before re-running deployment:

- [ ] Key file opened in Notepad
- [ ] **Entire** key copied (including BEGIN/END lines)
- [ ] GitHub secret updated (clicked edit → pasted → saved)
- [ ] No extra spaces before/after key
- [ ] Key format verified (starts with BEGIN, ends with END)
- [ ] Local SSH test works (optional but recommended)

---

## 🚀 **After Fixing**

1. **Update the secret** (follow Step 2 above)

2. **Re-run the workflow**:
   - Go to: `https://github.com/digitex-erp/bell24h/actions`
   - Click on the failed run
   - Click **"Re-run all jobs"**

3. **Monitor deployment**:
   - Should complete in 3-5 minutes
   - Watch for success message

---

## 🛠️ **If Still Failing**

If it still fails after updating the secret:

1. **Check GitHub Actions logs** for the exact error
2. **Verify secret name** is exactly `ORACLE_SSH_KEY` (case-sensitive)
3. **Try creating a new secret** with a different name and update workflow
4. **Check if key has passphrase** (it shouldn't for automation)

---

**Most Common Issue**: The key was copied without the BEGIN/END lines, or with extra spaces. Make sure to copy the ENTIRE file contents exactly as it appears in Notepad.

