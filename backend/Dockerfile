# Use a lightweight official Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
# This is a best practice to take advantage of Docker's layer caching.
# If these files don't change, the dependencies aren't reinstalled on every build.
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Expose the port the Express app runs on
EXPOSE 5000

RUN npm install -g nodemon
# npm install --save-dev nodemon ts-node?

# Command to run the application using npm
#CMD ["npm", "start"]
CMD ["npm", "run", "dev"]
#CMD ["nodemon", "--exec", "ts-node", "src/index.ts"]
#nodemon --exec ts-node src/index.ts
#ENTRYPOINT ["tail", "-f", "/dev/null"]