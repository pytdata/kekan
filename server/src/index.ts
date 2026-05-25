import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { verifyToken } from './utils/auth.js';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

initDb();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// File upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type;
    let dest = path.join(__dirname, '..', 'uploads');
    if (type === 'epub') dest = path.join(dest, 'books');
    else if (type === 'video') dest = path.join(dest, 'videos');
    else if (type === 'cover') dest = path.join(dest, 'covers');
    else if (type === 'thumbnail') dest = path.join(dest, 'thumbnails');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// File upload endpoints
const uploadSingle = (field: string) => upload.single(field);

app.post('/upload/:type', uploadSingle('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fileType = req.params.type;
  const ext = path.extname(req.file.originalname).toLowerCase();

  if (fileType === 'epub' && ext !== '.epub') {
    return res.status(400).json({ success: false, message: 'Only EPUB files allowed for books' });
  }
  if (fileType === 'video' && !['.mp4', '.webm', '.webp'].includes(ext)) {
    return res.status(400).json({ success: false, message: 'Only MP4/WEBM/WEBP files allowed for videos' });
  }
  if (fileType === 'cover' && !['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    return res.status(400).json({ success: false, message: 'Invalid image format' });
  }
  if (fileType === 'thumbnail' && !['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    return res.status(400).json({ success: false, message: 'Invalid image format' });
  }

  const url = `/uploads/${fileType === 'epub' ? 'books' : fileType === 'video' ? 'videos' : fileType === 'cover' ? 'covers' : 'thumbnails'}/${req.file.filename}`;
  res.json({ success: true, url });
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// GraphQL context
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          const row = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as Record<string, any> | undefined;
          if (row) {
            return {
              user: {
                id: row.id,
                email: row.email,
                name: row.name,
                avatar: row.avatar,
                auth_provider: row.auth_provider,
                role: row.role,
                subscription_status: row.subscription_status,
                is_verified: row.is_verified,
                created_at: row.created_at,
              },
            };
          }
        }
      }
      return { user: null };
    },
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Kenkan Books Server ready at http://localhost:${PORT}/graphql`);
  console.log(`📁 File uploads at http://localhost:${PORT}/upload/:type`);
});
