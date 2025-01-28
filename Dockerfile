# Step 1: Use an official Node.js image as the base
FROM node:18-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and install dependencies
COPY prisma ./prisma
COPY package.json yarn.lock ./
RUN yarn install

# Step 4: Copy application code
COPY . .

# Step 5: Expose the port the app runs on
EXPOSE 3000

# Step 6: Build and start the app
CMD yarn build && yarn start