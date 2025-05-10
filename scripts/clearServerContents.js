const admin = require('firebase-admin');
const path = require('path');

const topLevelKeys = [
"mfPArQl48UZwVulwNn7IaOK9wDF3"
]

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(__dirname, './serviceAccountKey.json'))),
  databaseURL: 'https://sdapp-5196f-default-rtdb.firebaseio.com',
});

const db = admin.database();

async function clearServerContents() {
  try {
    for (const key of topLevelKeys) {
      await db.ref(`v_1_1/server/${key}`).remove();
      console.log(`✅ Deleted child node: ${key}`);
    }

    console.log('✅ All top-level children under v_1_1/server have been cleared.');
  } catch (err) {
    console.error('❌ Error during deletion:', err.message || err);
  }
}

clearServerContents();
