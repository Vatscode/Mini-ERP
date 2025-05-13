const axios = require('axios');
const oauth = require('oauth-1.0a');
const crypto = require('crypto');

class NetSuiteService {
  constructor(config) {
    this.config = {
      accountId: process.env.NS_ACCOUNT_ID,
      consumerKey: process.env.NS_CONSUMER_KEY,
      consumerSecret: process.env.NS_CONSUMER_SECRET,
      tokenId: process.env.NS_TOKEN_ID,
      tokenSecret: process.env.NS_TOKEN_SECRET,
      baseUrl: `https://${process.env.NS_ACCOUNT_ID}.restlets.api.netsuite.com`,
      ...config
    };

    this.oauth = oauth({
      consumer: {
        key: this.config.consumerKey,
        secret: this.config.consumerSecret
      },
      signature_method: 'HMAC-SHA256',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha256', key)
          .update(base_string)
          .digest('base64');
      }
    });
  }

  // Generate OAuth headers
  getAuthHeaders(request) {
    return this.oauth.toHeader(this.oauth.authorize(request, {
      key: this.config.tokenId,
      secret: this.config.tokenSecret
    }));
  }

  // Sync inventory levels with NetSuite
  async syncInventory(items) {
    try {
      const request = {
        url: `${this.config.baseUrl}/app/site/hosting/restlet.nl`,
        method: 'POST',
        data: {
          script: 'customscript_inventory_sync',
          deploy: 'customdeploy_inventory_sync',
          items: items
        }
      };

      const response = await axios({
        ...request,
        headers: {
          ...this.getAuthHeaders(request),
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('NetSuite inventory sync failed:', error);
      throw error;
    }
  }

  // Create manufacturing work order in NetSuite
  async createWorkOrder(batch) {
    try {
      const request = {
        url: `${this.config.baseUrl}/app/site/hosting/restlet.nl`,
        method: 'POST',
        data: {
          script: 'customscript_create_work_order',
          deploy: 'customdeploy_create_work_order',
          batch: {
            quantity: batch.quantity,
            item: batch.recipe.product.sku,
            components: batch.recipe.items.map(item => ({
              item: item.ingredient.sku,
              quantity: item.quantity * batch.quantity
            }))
          }
        }
      };

      const response = await axios({
        ...request,
        headers: {
          ...this.getAuthHeaders(request),
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('NetSuite work order creation failed:', error);
      throw error;
    }
  }

  // Fetch item availability from NetSuite
  async getItemAvailability(skus) {
    try {
      const request = {
        url: `${this.config.baseUrl}/app/site/hosting/restlet.nl`,
        method: 'GET',
        data: {
          script: 'customscript_item_availability',
          deploy: 'customdeploy_item_availability',
          skus: skus.join(',')
        }
      };

      const response = await axios({
        ...request,
        headers: {
          ...this.getAuthHeaders(request),
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('NetSuite item availability check failed:', error);
      throw error;
    }
  }

  // Update work order status in NetSuite
  async updateWorkOrderStatus(workOrderId, status) {
    try {
      const request = {
        url: `${this.config.baseUrl}/app/site/hosting/restlet.nl`,
        method: 'PUT',
        data: {
          script: 'customscript_update_work_order',
          deploy: 'customdeploy_update_work_order',
          workOrderId,
          status
        }
      };

      const response = await axios({
        ...request,
        headers: {
          ...this.getAuthHeaders(request),
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('NetSuite work order status update failed:', error);
      throw error;
    }
  }
}

module.exports = new NetSuiteService(); 