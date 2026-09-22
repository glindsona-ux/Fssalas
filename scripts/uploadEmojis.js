// ─────────────────────────────────────────────────────────────────────────
// Sobe todos os arquivos de assets/emojis/ como "application emojis" do bot.
//
// Application emojis ficam disponíveis em QUALQUER servidor onde o bot
// estiver, sem precisar criar emoji em cada servidor e sem gastar os slots
// de emoji do servidor.
//
// Uso:
//   npm run upload-emojis
//
// Pode rodar de novo a qualquer momento: emojis já enviados (mesmo nome)
// são pulados automaticamente.
// ─────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'emojis');
const CACHE_PATH = path.join(__dirname, '..', 'data', 'emojis.json');

const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('❌ DISCORD_TOKEN e CLIENT_ID são obrigatórios no .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

const MIME = { '.png': 'image/png', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

// Nomes de emoji do Discord: 2–32 caracteres, apenas letras/números/underscore
function toEmojiName(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 32);
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Pasta não encontrada: ${ASSETS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(ASSETS_DIR)
    .filter((f) => MIME[path.extname(f).toLowerCase()]);

  if (files.length === 0) {
    console.error('❌ Nenhum .png/.gif/.jpg encontrado em assets/emojis/');
    process.exit(1);
  }

  // Carrega cache existente + emojis já cadastrados na aplicação
  let cache = {};
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    cache = {};
  }

  console.log('🔎 Buscando emojis já existentes na aplicação...');
  const existing = await rest.get(Routes.applicationEmojis(CLIENT_ID));
  const existingByName = {};
  for (const em of existing.items ?? existing) {
    existingByName[em.name] = em;
  }

  console.log(`📦 ${files.length} arquivo(s) encontrado(s). Enviando...\n`);

  let enviados = 0;
  let pulados = 0;
  let falhas = 0;

  for (const file of files) {
    const key = toEmojiName(file);
    const name = key;

    if (existingByName[name]) {
      cache[key] = {
        id: existingByName[name].id,
        name: existingByName[name].name,
        animated: existingByName[name].animated ?? path.extname(file).toLowerCase() === '.gif',
      };
      console.log(`↷  ${name} — já existe, pulando`);
      pulados++;
      continue;
    }

    try {
      const ext = path.extname(file).toLowerCase();
      const buffer = fs.readFileSync(path.join(ASSETS_DIR, file));
      const b64 = buffer.toString('base64');
      const image = `data:${MIME[ext]};base64,${b64}`;

      const created = await rest.post(Routes.applicationEmojis(CLIENT_ID), {
        body: { name, image },
      });

      cache[key] = { id: created.id, name: created.name, animated: ext === '.gif' };
      console.log(`✅ ${name} enviado (id: ${created.id})`);
      enviados++;

      // pequena pausa para não estourar rate limit
      await sleep(400);
    } catch (err) {
      const msg = err?.rawError?.message || err.message;
      console.error(`❌ Falha ao enviar "${name}": ${msg}`);
      falhas++;
    }
  }

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  console.log('\n─────────────────────────────');
  console.log(`✅ Enviados: ${enviados}`);
  console.log(`↷  Já existiam: ${pulados}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log(`💾 Salvo em: ${CACHE_PATH}`);
  console.log('─────────────────────────────');
  console.log('\nAgora é só rodar "npm start" — o bot já vai usar os emojis personalizados.');
}

main().catch((err) => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});
    
