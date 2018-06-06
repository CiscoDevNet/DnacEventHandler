# DNA Center Assurance Event Handler
This repo is an example of how to write a simple event handler for DNA Center Assurance (Events and Health)

![](https://github.com/CiscoDevNet/DnacEventHandler/blob/master/webhook.png)
This sample is written as a simple Microservice which uses the Serverless Framework

## Prerequisite
* [Node.js 8+](https://nodejs.org)

## Geting Started:

There are two modes in which this application can be run. 

* Run locally in your network or 
* On AWS Lambda

### Steps:

Install Serverless Framework

`
npm install -g serverless
`    

Clone this Repository

~~~
git clone https://github.com/CiscoDevNet/DnacEventHandler.git
~~~

Install nodejs dependencies

~~~
npm i
~~~

### Local Development
~~~
sls offline start 
~~~

### AWS Lambda Deployment
1. Setup AWS access key and secret key

  In the command prompt of the shell

~~~
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
~~~

2. Deployment

~~~
sls deploy        # deploy to AWS Lambda for the first time
~~~
or if it is already deployed:

~~~
sls deploy function -f app  # deploy code to AWS Lambda
~~~

3. Check Logs
~~~
sls logs -f app -t
~~~

### Usage
Start the server using the command:

`$ sls offline start`

Serverless: Starting Offline: dev/ap-southeast-1.

Serverless: Routes for app:
Serverless: ANY /
Serverless: ANY /{proxy*}

Serverless: Offline listening on http://localhost:3000

### The WebHook is now running port 3000


There are 2 endpoints that this service exposes:

1. /v1/rules  (http://0.0.0.0:3000/v1/rules)
2. /v1/events (http://0.0.0.0:3000/v1/events)


### Rules:
Rule are very simple instructions written in Javascript format. Use curl to send a POST req using the sample RULE provided for reference in the file https://github.com/CiscoDevNet/DnacEventHandler/blob/master/SampleRule.json

~~~
curl -H "Content-Type: application/json" -X POST --data @SampleRule.json http://0.0.0.0:3000/v1/rules
~~~

Rule will be evaluated in a context where **this** is the event passed to the rule for evaluation. Using **this** to reference a field in event, like:
* this.severity
* this.priority
* this.connectedDevice[0].hostname

### Events:

You can simulate the event to your Webhook with curl using the sample Event provided for reference in the file https://github.com/CiscoDevNet/DnacEventHandler/blob/master/SampleEvent.json

~~~
curl -H "Content-Type: application/json" -X POST --data @SampleEvent.json http://0.0.0.0:3000/v1/events
~~~


