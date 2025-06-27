import express from "express"
import { connectDB } from "./db.js"
import multer from "multer";
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';
import Users from "./models/users.js";
import { countReset } from "console";
import cors from "cors"

const app = express()
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json())
app.use(cors())
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

app.get("/test", (req, res) => {
  res.json({ message: "test" })
})

app.post('/api/upload', upload.single('image'), async (req, res) => {
  const file = req.file!;
  // console.log("file: ", file)

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'demo', // optional
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    res.status(200).json({ url: (result as any).secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post("/api/submit", async (req, res) => {
  const userinfo = req.body

  const newUser = new Users(userinfo)

  try {
    await newUser.save()
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error })
  }
})


app.listen(5000, () => {
  connectDB()
  console.log("server started at http://localhost:5000")
})
