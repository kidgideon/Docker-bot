# Use the official Node.js 18 image as the base
FROM node:18

# Install necessary dependencies for Playwright browsers
RUN apt-get update && apt-get install -y \
  libnss3 \
  libnspr4 \
  libdbus-1-3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libatspi2.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libxkbcommon0 \
  libasound2 \
  && rm -rf /var/lib/apt/lists/*

# Create your app directory (update this if your directory is named differently)
WORKDIR /DOCKER

# Copy package.json into the container (no package-lock.json)
COPY package.json ./

# Install app dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install

# Copy all files from your local project into the container
COPY . .

# Expose the port your Express server will run on (default is 3000)
EXPOSE 3000

# Define the command to run your app (npm start)
CMD [ "node", "index.js" ]
