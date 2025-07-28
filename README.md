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

3.  **Apply the CORS configuration**: Run the following command from your project's root directory.

    ```bash
    gcloud storage buckets update gs://ai-tool-explorer-txijl.firebasestorage.app --cors-file=./cors.json
    ```

    **Note on Bucket Names:**
    *   The command above uses the `gsutil` URI for your bucket (`gs://...`). This is the format the `gcloud` CLI expects. You can find this URI in the Firebase Console's Storage section or the Google Cloud Console.
    *   In your application code (like `src/lib/firebase/client.ts`), you might see the bucket name in the format `ai-tool-explorer-txijl.appspot.com`. Both of these names point to the same bucket.

This will allow your web application to upload files to Firebase Storage.
