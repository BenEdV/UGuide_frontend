FROM node:12.19.0

# set working directory
WORKDIR /app
ARG DOMAIN_NAME
ARG API_PUBLIC_POSTFIX
ARG PUBLIC_PORT_HTTPS
ARG HIDE_SIDENAV
ARG HIDE_BREADCRUMBS
ARG ALLOW_REGISTRATION
ARG COLLECTION_HOMEPAGE
ARG DASHBOARD_HOMEPAGE
ARG USER_AGREEMENT_I18N_KEY
ARG CAPTCHA_SITE_KEY
ARG PRODUCT_NAME
ARG PROJECT_NAME
ARG SHOW_POWERED_BY
ARG SHOW_PROJECT_NAME
ARG SAML_CLIENT_ID
ARG SAML_AUTH_URL
ARG SAML_LOGOUT_URL
ARG HOVER_LOG_TIMEOUT

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli@10.0.7

# add app
COPY . /app

# Add environment variables from docker-compose
RUN export DOLLAR='$'
RUN envsub src/environments/environment.prod.ts.temp src/environments/environment.prod.ts

# start app
CMD npm run build-prod
