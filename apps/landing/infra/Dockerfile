#node
FROM node:14-alpine

WORKDIR /app
COPY dist/apps/landing /app/
ENV PORT 80
# Expose the port the app runs in
EXPOSE 80

# Serve the app
CMD ["node", "server/main"]