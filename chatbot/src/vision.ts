import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleAuth, grpc } from 'google-gax';
import { settings } from './settings';

function getApiKeyCredentials() {
  const sslCreds = grpc.credentials.createSsl();
  const googleAuth = new GoogleAuth();
  const authClient = googleAuth.fromAPIKey(settings.secrets.googleRecogApiKey);
  const credentials = grpc.credentials.combineChannelCredentials(
    sslCreds,
    grpc.credentials.createFromGoogleCredential(authClient),
  );
  return credentials;
}
// initialize the client
const sslCreds = getApiKeyCredentials();
export const vision = new ImageAnnotatorClient({ sslCreds });
