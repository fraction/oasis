FROM node:lts

# Ensure that the ~/.ssb directory is persistent and owned by the 'node' user.
RUN mkdir /home/node/.ssb && chown node:node /home/node/.ssb
VOLUME /home/node/.ssb

# Don't run as root.
USER node

# Create app directory and use it.
RUN mkdir /home/node/app
WORKDIR /home/node/app

# Add dependency metadata and install dependencies.
ADD package.json package-lock.json ./
RUN npm ci

# Add the rest of the source code.
ADD ./ ./

# Expose ports for Oasis and SSB replication.
EXPOSE 3000 8008

# Listen on the container's public interfaces but allow 'localhost' connections.
CMD ["node", ".", "--host", "0.0.0.0", "--allow-host", "localhost"]
