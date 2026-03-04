const fetch = require('node-fetch');
/**
 * Submission Client to invoke all available Store Submission API and Asset Upload to Blob Store
 */
class SubmissionClient{

    constructor(config){
        this.configuration = config;
        this.accessToken = "";
        this.configuration.applicationId = this.configuration.unpackagedApplicationId;  //REuse configuration across packaged and unpackaged 
        this.packagesUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/packages`;
        this.packageByIdUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/packages/{packageId}`;
        this.packagesCommitUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/packages/commit`;
        this.appMetadataUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/metadata`;
        this.appListingsFetchMetadataUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/metadata/listings`;
        this.listingAssetsUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/listings/assets`;
        this.listingAssetsCreateUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/listings/assets/create`;
        this.listingAssetsCommitUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/listings/assets/commit`;
        this.productDraftStatusPollingUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/status`;
        this.createSubmissionUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/submit`;
        this.submissionStatusPollingUrlTemplate = `/submission/v${this.configuration.version}/product/${this.configuration.applicationId}/submission/{submissionId}/status`;
    }
    
    async getAccessToken(){
        var params = new URLSearchParams();
        params.append('grant_type','client_credentials');
        params.append('client_id',this.configuration.clientId);
        params.append('client_secret',this.configuration.clientSecret);
        params.append('scope',this.configuration.scope);
        var response = await fetch(this.configuration.tokenEndpoint,{
            method: "POST",
            body: params
        });    
        var data = await response.json();
        this.accessToken = data.access_token;
    }

    async callStoreAPI(url, method, data){
        var request = {
            method: method,
            headers:{
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': this.configuration.jsonContentType,
                'X-Seller-Account-Id': this.configuration.sellerId
            },            
        };
        if(data){
            request.body = JSON.stringify(data);
        }

        if (this.configuration.printRequests) {            
            console.log(`--- ${method}: ${this.configuration.devCenterEndpoint}${url} ---`);
            if ( data )
                console.log(JSON.stringify(data));
        }

        var response = await fetch(`${this.configuration.serviceEndpoint}${url}`,request);
        var jsonResponse = await response.json();
        return jsonResponse;
    }

    async uploadAssets(url, stream, size){
        var request = {
            method: 'put',
            headers:{
                'Content-Type': this.configuration.pngContentType,
                'x-ms-blob-type': 'BlockBlob',
                "Content-length": size
            },            
            body: stream
        };
        var response = await fetch(`${url}`,request);
        if(response.ok){
            return response;
        }
        else{
            throw new Error('Uploading of assets failed');
        }
    }
}
module.exports = SubmissionClient;