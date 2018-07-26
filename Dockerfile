# Install application dependencies
FROM node:alpine AS dependencies
ENV NODE_ENV production
WORKDIR /home/node/app
COPY package*.json ./
RUN ["npm", "install"]

# Copy over the application files
FROM dependencies
COPY . ./

# Set the application parameters
ENV PORT 3000
EXPOSE ${PORT}

# Set the default command to serve
USER node
CMD ["node", "bin/www"]
