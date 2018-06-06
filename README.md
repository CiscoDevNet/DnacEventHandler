# DNA Center Assurance Event Handler
This repo is an example of how to write a simple event handler for DNA Center Assurance (Events and Health)

![](https://github.com/CiscoDevNet/DnacEventHandler/blob/master/webhook.png)
This sample is written as a simple Microservice which uses the Serverless Framework

## Geting Started:

There are two modes in which this application can be run. 

* Run locally in your network or 
* On AWS

### Steps:

Install Serverless Framework

`
npm install -g serverless
`    

Clone this Repository

~~~
git clone https://github.com/CiscoDevNet/DnacEventHandler.git
~~~


Setup AWS access key and secret key

In the command prompt of the shell

~~~
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
~~~


Install nodejs dependencies

~~~
npm i
~~~

### Local Development
~~~
sls offline start 
~~~

2. Check Logs
~~~
sls logs -f app -t
~~~

### AWS Deployment
1. Create a new encryption key in AWS IAM, collect the key id, which will be used later to encrypt secrets.


3. Deploy to AWS

~~~
sls deploy        # deploy to AWS Lambda for the first time
~~~
or if it is already deployed:

~~~
sls deploy function -f app  # deploy code to AWS Lambda
~~~


### Usage
Start the server using the command:

`$ sls offline`

Serverless: Starting Offline: dev/ap-southeast-1.

Serverless: Routes for app:
Serverless: ANY /
Serverless: ANY /{proxy*}

Serverless: Offline listening on http://localhost:3000

### The WebHook is now running port 3000


There are 2 endpoints that this service exposes:

1. /v1/events (http://0.0.0.0:3000/v1/events)
2. /v1/rules  (http://0.0.0.0:3000/v1/rules)


### Events:

You can simulate the event to your Webhook in the following way. Use this python code to send a POST req using the sample Event provided for reference in the file https://github.com/CiscoDevNet/DnacEventHandler/blob/master/SampleEvent

~~~
import requests

url = "http://0.0.0.0:3000/v1/events"

payload = " INSERT JSON HERE from Sample"
headers = {
    'Content-Type': "application/json",
    'Cache-Control': "no-cache",
    'Postman-Token': "2c99a33a-4b21-4b1e-a995-beb1daa05d3c"
    }

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)
~~~

### Rules:
Rule are very simple instructions written in Javascript format. Use this python code to send a POST req using the sample RULE provided for reference in the file https://github.com/CiscoDevNet/DnacEventHandler/blob/master/SampleRule

~~~
import requests

url = "http://localhost:3000/v1/rules"

payload = "INSERT SAMPLE RULE"
headers = {
    'Content-Type': "application/json",
    'Cache-Control': "no-cache",
    'Postman-Token': "d0281234-1470-4389-9918-5415df0219a8"
    }

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)
~~~
