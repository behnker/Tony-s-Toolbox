# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Fixing File Uploads (CORS Configuration)

If file uploads to Firebase Storage are failing with a CORS error, you need to apply a CORS configuration to your Cloud Storage bucket.

1.  **Install the Google Cloud CLI (`gcloud`)**: If you don't have it, [install it now](https://cloud.google.com/sdk/docs/install).

2.  **Authenticate**: Log in with the account associated with your Firebase project:
    ```bash
    gcloud auth login
    ```

3.  **Apply the CORS configuration**: Run the following command from your project's root directory, replacing `[YOUR_BUCKET_NAME]` with your actual storage bucket name (e.g., `gs://ai-tool-explorer-txijl.appspot.com`). You can find your bucket name in the Firebase Console under Storage.

    ```bash
    gcloud storage buckets update gs://[YOUR_BUCKET_NAME] --cors-file=./cors.json
    ```

This will allow your web application to upload files to Firebase Storage.
