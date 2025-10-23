# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker's layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Expose the port the React app runs on
EXPOSE 3000

# Command to start the development server
CMD ["npm", "run", "dev"]
#ENTRYPOINT ["tail", "-f", "/dev/null"]