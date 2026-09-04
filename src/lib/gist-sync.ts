/**
 * GitHub Gist Bulut Senkronizasyonu & Akıllı Gist Keşfi Servisi (Gist Cloud Sync)
 * 
 * - Kullanıcının kendi GitHub hesabı üzerinde gizli (secret) Gist deposu yönetir.
 * - Akıllı Gist Keşfi (Smart Discovery): Format sonrasında yeni token girildiğinde,
 *   önceki Gist'i otomatik olarak bulur ve bağlar.
 * - Zaman Makinesi (Time Machine): Geçmiş commit/tarih sürümlerini listeler.
 * - Çoklu Yedek (Multi-Slot): Tek Gist içinde farklı cihaz/tarayıcı yedekleri tutar.
 */

export const GIST_VAULT_DESCRIPTION = "Extensity+ HaYTooL Backup Vault";
export const DEFAULT_BACKUP_FILENAME = "extensityplus-backup.json";
export const STORAGE_KEY_TOKEN = "github_backup_token";
export const STORAGE_KEY_GIST_ID = "github_backup_gist_id";
export const STORAGE_KEY_USER_PROFILE = "github_user_profile";

export interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
}

export interface GistFileInfo {
  filename: string;
  size: number;
  rawUrl: string;
}

export interface GistCommitInfo {
  version: string; // Commit SHA
  committedAt: string; // ISO Date string
  changeStatus?: {
    total: number;
    additions: number;
    deletions: number;
  };
}

export interface GistVault {
  id: string;
  description: string;
  htmlUrl: string;
  updatedAt: string;
  files: Record<string, GistFileInfo>;
}

/**
 * Kullanıcının girdiği GitHub Kişisel Erişim Belirtecini (PAT) doğrular
 * ve profil bilgilerini döner.
 */
export async function verifyGitHubToken(token: string): Promise<GitHubUserProfile> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error("Token cannot be empty.");
  }

  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Invalid or expired GitHub token.");
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    htmlUrl: data.html_url,
  };
}

function normalizeGistFiles(filesObj: any): Record<string, GistFileInfo> {
  const normalized: Record<string, GistFileInfo> = {};
  for (const [key, val] of Object.entries(filesObj || {})) {
    const item = val as any;
    normalized[key] = {
      filename: item.filename || key,
      size: item.size || 0,
      rawUrl: item.raw_url || item.rawUrl || "",
    };
  }
  return normalized;
}

/**
 * Akıllı Gist Keşfi (Smart Gist Discovery):
 * Kullanıcının hesabındaki Gist'leri tarar; Extensity+ yedeği olan kasayı bulur.
 */
export async function findExistingBackupGist(token: string): Promise<GistVault | null> {
  const res = await fetch("https://api.github.com/gists?per_page=100", {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to list gists: ${res.status}`);
  }

  const gists = (await res.json()) as Array<{
    id: string;
    description: string | null;
    html_url: string;
    updated_at: string;
    files: Record<string, any>;
  }>;

  // 1. Öncelik: Açıklamasında tam etiketimiz geçen Gist
  let matched = gists.find(
    (g) => g.description && g.description.includes(GIST_VAULT_DESCRIPTION)
  );

  // 2. Öncelik: Dosyalarında extensityplus-backup.json barındıran Gist
  if (!matched) {
    matched = gists.find((g) =>
      Object.keys(g.files || {}).some(
        (f) => f.toLowerCase().includes("extensityplus") || f === DEFAULT_BACKUP_FILENAME
      )
    );
  }

  if (!matched) return null;

  return {
    id: matched.id,
    description: matched.description || GIST_VAULT_DESCRIPTION,
    htmlUrl: matched.html_url,
    updatedAt: matched.updated_at,
    files: normalizeGistFiles(matched.files),
  };
}

/**
 * Kullanıcının hesabında sıfırdan ilk gizli (secret) Extensity+ Gist kasasını oluşturur.
 */
export async function createBackupGist(
  token: string,
  initialContent: string,
  filename = DEFAULT_BACKUP_FILENAME
): Promise<GistVault> {
  const payload = {
    description: GIST_VAULT_DESCRIPTION,
    public: false, // %100 Gizli / Secret Gist
    files: {
      [filename]: {
        content: initialContent,
      },
    },
  };

  const res = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create backup Gist: ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    description: data.description,
    htmlUrl: data.html_url,
    updatedAt: data.updated_at,
    files: normalizeGistFiles(data.files),
  };
}

/**
 * Belirtilen Gist kasasına güncel yedek verisini kaydeder (Gist Push).
 * İsteğe bağlı olarak farklı bir dosya adı/slot kullanılabilir.
 */
export async function pushBackupToGist(
  token: string,
  gistId: string,
  content: string,
  filename = DEFAULT_BACKUP_FILENAME
): Promise<GistVault> {
  const payload = {
    description: GIST_VAULT_DESCRIPTION,
    files: {
      [filename]: {
        content,
      },
    },
  };

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update backup Gist: ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    description: data.description,
    htmlUrl: data.html_url,
    updatedAt: data.updated_at,
    files: normalizeGistFiles(data.files),
  };
}

/**
 * Gist detayını ve içindeki tüm dosya/slot listesini çeker.
 */
export async function getGistVault(token: string, gistId: string): Promise<GistVault> {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Gist details: ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    description: data.description,
    htmlUrl: data.html_url,
    updatedAt: data.updated_at,
    files: normalizeGistFiles(data.files),
  };
}

/**
 * Zaman Makinesi (Time Machine):
 * Gist kasasının geçmişteki commit / sürüm listesini döner.
 */
export async function getGistCommitHistory(
  token: string,
  gistId: string
): Promise<GistCommitInfo[]> {
  const res = await fetch(`https://api.github.com/gists/${gistId}/commits?per_page=30`, {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Gist commit history: ${res.status}`);
  }

  const data = (await res.json()) as Array<{
    version: string;
    committed_at: string;
    change_status?: { total: number; additions: number; deletions: number };
  }>;

  return data.map((c) => ({
    version: c.version,
    committedAt: c.committed_at,
    changeStatus: c.change_status,
  }));
}

/**
 * Belirli bir dosyanın veya belirli bir commit (tarih) sürümünün içeriğini çeker.
 */
export async function fetchGistContent(
  token: string,
  gistId: string,
  filename = DEFAULT_BACKUP_FILENAME,
  commitSha?: string
): Promise<string> {
  // Eğer belirli bir commit sürümü isteniyorsa o commit'in anlık görüntüsünü çek
  const url = commitSha
    ? `https://api.github.com/gists/${gistId}/${commitSha}`
    : `https://api.github.com/gists/${gistId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to read Gist content: ${res.status}`);
  }

  const data = await res.json();
  const fileObj = data.files && data.files[filename];

  if (!fileObj) {
    // İlk bulunan json dosyasını fallback al
    const anyJson = Object.values(data.files || {}).find(
      (f: any) => f.filename && f.filename.endsWith(".json")
    ) as any;
    if (anyJson && anyJson.content) {
      return anyJson.content;
    }
    throw new Error(`File '${filename}' not found in Gist.`);
  }

  return fileObj.content;
}
