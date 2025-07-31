import { Injectable } from '@nestjs/common';
import configurations from 'src/config';

@Injectable()
export class SalesforceService {
    async getAccessToken(): Promise<string> {
        const url = 'https://emitcstime-dev-ed.my.salesforce.com/services/oauth2/token';
        const params = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: String(configurations.CLIENT_ID),
            client_secret: String(configurations.CLIENT_SECRET),
            username: String(configurations.CLIENT_USER_NAME),
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed: ${error}`);
        }

        const data = await response.json();
        return data.access_token;
    }

    async getTimeSheet(contactId: string): Promise<any> {
        const accessToken = await this.getAccessToken();

        const url = `https://emitcstime-dev-ed.my.salesforce.com/services/apexrest/emitcs2/getTimeBillingForResource?contactId=${encodeURIComponent(contactId)}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed: ${error}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch time billing:', error?.response?.data || error.message);
            throw new Error('Unable to retrieve time billing data');
        }
    }
}
