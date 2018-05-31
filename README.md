DnacEventHandler
================
DevNet CoCreate DnacEventHandler Microservice

### Get Started
1. Install Serverless Framework
~~~
    npm install -g serverless
~~~

2. Setup AWS access key and secret key
~~~
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
~~~

3. Install nodejs dependencies
~~~
npm i
~~~

### Local Development
~~~
sls offline start --SMARTSHEET_TOKEN=YOUR_SMARTSHEET_TOKEN --JWT_SECRET=YOUR_JWT_SECRET
~~~

2. Check Logs
~~~
sls logs -f app -t
~~~

### Deployment
1. Create a new encryption key in AWS IAM, collect the key id, which will be used later to encrypt secrets.
2. Put jwt secret in AWS KMS
~~~
sls encrypt -n SMARTSHEET_TOKEN -v smartsheet_token [-k keyId]
~~~

3. Deploy to AWS

~~~
sls deploy        # deploy to AWS Lambda for the first time
~~~
or if already deployed:
~~~
sls deploy function -f app  # deploy code to AWS Lambda
~~~


### Usage
