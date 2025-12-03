FROM nginx:alpine

# Copy built app
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure favicon is properly served
RUN ln -sf /usr/share/nginx/html/favicon.ico /usr/share/nginx/html/favicon.ico

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
