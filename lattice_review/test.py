import os
from googleapiclient.discovery import build
from google.oauth2 import service_account

# 1. Point to your service account key file
KEY_FILE = 'gcp_key.json'
YOUR_PERSONAL_EMAIL = 'obaidalisayyed8055@gmail.com' # <--- Change this to your email

# 2. Define the scopes required to view and modify Drive permissions
SCOPES = ['https://googleapis.com']

# 3. Authenticate with the service account
creds = service_account.Credentials.from_service_account_file(KEY_FILE, scopes=SCOPES)
drive_service = build('drive', 'v3', credentials=creds)

print("Checking Service Account's private Drive storage...")

# 4. List all files currently sitting inside the service account's Drive
results = drive_service.files().list(
    pageSize=10, 
    fields="nextPageToken, files(id, name, mimeType)"
).execute()

items = results.get('files', [])

if not items:
    print('No files found in the Service Account\'s Drive.')
else:
    print(f"\nFound {len(items)} file(s). Transferring access to your personal Drive now:\n")
    for item in items:
        print(f"File Found: '{item['name']}' (ID: {item['id']})")
        
        # 5. Create a permission payload to share the file with your email
        user_permission = {
            'type': 'user',
            'role': 'writer', # Grants you edit/download permission
            'emailAddress': YOUR_PERSONAL_EMAIL
        }
        
        try:
            drive_service.permissions().create(
                fileId=item['id'],
                body=user_permission,
                fields='id'
            ).execute()
            print(f"-> SUCCESS: '{item['name']}' has been shared with {YOUR_PERSONAL_EMAIL}!")
            print(f"-> Check your personal Google Drive under the 'Shared with me' tab.\n")
        except Exception as e:
            print(f"-> FAILED to share '{item['name']}': {e}\n")
