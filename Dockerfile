# Use the official Node.js 18 image as the base
FROM node:18

# Create your app directory (update this if your directory is named differently)
WORKDIR /DOCKER

# Copy package.json into the container (no package-lock.json)
COPY package.json ./

# Install app dependencies
RUN npm install

# Copy all files from your local project into the container
COPY . .

# Expose the port your Express server will run on (default is 3000)
EXPOSE 3000

# Define the command to run your app (npm start)
CMD [ "node", "server.js" ]
