# MERN stack demo
 Stack List:
  package manager: pnpm (+workspace feature)
  frontend: React
  backend: Express
  database: Mongodb
  file upload: Cloudinary
  database orm & query tool: mongoose

# To build the project 

You need to run pnpm:build. This runs build command for both frontend and backend in parallel.
It is deployed on [render](https://render.com) manually, link in description.

### The reason frontend is not connected to express backend is because both are deployed seperate manually. The advantage to this is render uses its CDN to send it to the clients all over the world which is faster and more reliable than a single node backend servering your static assets.

*note: Everything is written from scratch, no 3rd party library is used except multer(to handle file since express doesn't support that)*
