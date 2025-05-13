/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
    function(record, search) {
        function _post(context) {
            try {
                log.debug('Inventory Sync Request', context);
                
                const items = context.items;
                const results = [];

                items.forEach(item => {
                    // Load the inventory item record
                    const invItem = record.load({
                        type: record.Type.INVENTORY_ITEM,
                        id: item.internalId
                    });

                    // Update quantities
                    invItem.setValue({
                        fieldId: 'locationquantityavailable',
                        value: item.quantity,
                        ignoreFieldChange: true
                    });

                    // Save the record
                    const savedId = invItem.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });

                    results.push({
                        sku: item.sku,
                        internalId: savedId,
                        status: 'updated'
                    });
                });

                return {
                    success: true,
                    results: results
                };
            } catch (e) {
                log.error('Inventory Sync Error', e);
                return {
                    success: false,
                    error: e.message
                };
            }
        }

        return {
            post: _post
        };
    }); 