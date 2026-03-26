const fetch = require('node-fetch');
/**
 * Submission Client for the DevCenter API (packaged MSIX apps)
 * Equivalent to SubmissionClient.js but targets https://manage.devcenter.microsoft.com
 */
class PackagedSubmissionClient {

    constructor(config) {
        this.configuration = config;
        this.accessToken = "";
        this.configuration.applicationId = this.configuration.packagedApplicationId;  //REuse configuration across packaged and unpackaged 
        this.appUrl = `/applications/${this.configuration.applicationId}`;
        this.submissionsUrl = `/applications/${this.configuration.applicationId}/submissions`;
        this.submissionUrl = `/applications/${this.configuration.applicationId}/submissions/{submissionId}`;
        this.commitUrl = `/applications/${this.configuration.applicationId}/submissions/{submissionId}/commit`;
        this.statusUrl = `/applications/${this.configuration.applicationId}/submissions/{submissionId}/status`;
        this.deleteUrl = `/applications/${this.configuration.applicationId}/submissions/{submissionId}`;
    }

    async getAccessToken() {
        var params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', this.configuration.clientId);
        params.append('client_secret', this.configuration.clientSecret);
        params.append('resource', this.configuration.devCenterResource);
        var response = await fetch(this.configuration.devCenterTokenEndpoint, {
            method: "POST",
            body: params
        });
        var data = await response.json();
        if ( data.error || !data.access_token) {
            let message = `Error acquiring access token: ${data.error}`;
            if (data.error_description) {
                message += ` - ${data.error_description}`;
            }
            console.error(message); 
            throw new Error(`Failed to acquire access token: ${message}`);
        }
        this.accessToken = data.access_token;
    }

    async callDevCenterAPI(url, method, data) {
        var request = {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': this.configuration.jsonContentType
            },
        };
        if (data) {
            request.body = JSON.stringify(data);
        }

        if (this.configuration.printRequests) {            
            console.log(`--- ${method}: ${this.configuration.devCenterEndpoint}${url} ---`);
            if ( data )
                console.log(JSON.stringify(data));
        }


        var response = await fetch(`${this.configuration.devCenterEndpoint}${url}`, request);
        if (method.toLowerCase() === 'delete' && response.ok) {
            return { status: response.status };
        }
        var jsonResponse = await response.json();
        return jsonResponse;
    }

    async uploadPackage(sasUrl, zipStream, size) {
        var request = {
            method: 'put',
            headers: {
                'Content-Type': this.configuration.binaryStreamContentType,
                'x-ms-blob-type': 'BlockBlob',
                'Content-Length': size
            },
            body: zipStream
        };
        var response = await fetch(`${sasUrl}`, request);
        if (response.ok) {
            return response;
        } else {
            throw new Error('Uploading of package ZIP failed');
        }
    }
}
module.exports = PackagedSubmissionClient;
