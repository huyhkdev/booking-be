import admin from "firebase-admin";
import serviceAccount from "./development-3d747-firebase-adminsdk-p76tc-0c5666a638.json"; // Đảm bảo đúng đường dẫn

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;