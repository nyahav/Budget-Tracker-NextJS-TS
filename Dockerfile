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

# Add wait-for-it
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Step 5: Build the application
# Build after ensuring Redis is ready



# Step 6: Expose the port the app runs on
EXPOSE 3000

# Step 7: Start the app
CMD /wait-for-it.sh redis:6379 -- sh -c "yarn build && yarn start"








