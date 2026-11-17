const DATABASE_NAME = "brainbytes-fighter-models";
const STORE_NAME = "models";
const DATABASE_VERSION = 1;
const MAX_MODEL_BYTES = 50 * 1024 * 1024;
const VALID_SLOTS = new Set(["player", "opponent"]);

function openModelDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "slot" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("3D model storage could not be opened."));
    request.onblocked = () => reject(new Error("3D model storage is busy in another tab. Close that tab and try again."));
  });
}

function validateModelFile(slot, file) {
  if (!VALID_SLOTS.has(slot)) {
    throw new Error("Choose either the player or opponent slot.");
  }
  if (!(file instanceof File)) {
    throw new Error("Choose a 3D model file to upload.");
  }
  if (!/\.(glb|vrm)$/i.test(file.name)) {
    throw new Error("Upload a .glb or .vrm 3D model.");
  }
  if (file.size === 0 || file.size > MAX_MODEL_BYTES) {
    throw new Error("The 3D model must be smaller than 50 MB.");
  }
}

export async function saveFighterModel(slot, file) {
  validateModelFile(slot, file);
  const buffer = await file.arrayBuffer();
  const database = await openModelDatabase();
  const record = { slot, name: file.name, type: file.type, buffer, updatedAt: Date.now() };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve({ ...record, blob: new Blob([buffer], { type: file.type }) });
    transaction.onerror = () => reject(transaction.error || new Error("The 3D model could not be saved."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving the 3D model was cancelled."));
  });
}

export async function loadFighterModels() {
  const database = await openModelDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const models = {};
      for (const record of request.result) {
        if (VALID_SLOTS.has(record.slot) && record.buffer instanceof ArrayBuffer) {
          models[record.slot] = {
            ...record,
            blob: new Blob([record.buffer], { type: record.type || "application/octet-stream" })
          };
        }
      }
      resolve(models);
    };
    request.onerror = () => reject(request.error || new Error("Saved 3D models could not be loaded."));
    transaction.onerror = () => reject(transaction.error || new Error("3D model storage could not be read."));
  });
}
