/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
    function(record, search) {
        function _post(context) {
            try {
                log.debug('Work Order Creation Request', context);
                
                const batch = context.batch;

                // Create Work Order record
                const workOrder = record.create({
                    type: record.Type.WORK_ORDER,
                    isDynamic: true
                });

                // Set main fields
                workOrder.setValue({
                    fieldId: 'assemblyitem',
                    value: batch.item
                });

                workOrder.setValue({
                    fieldId: 'quantity',
                    value: batch.quantity
                });

                workOrder.setValue({
                    fieldId: 'status',
                    value: 'Planned' // Work Order status
                });

                // Add components (ingredients)
                batch.components.forEach(component => {
                    workOrder.selectNewLine({
                        sublistId: 'component'
                    });

                    workOrder.setCurrentSublistValue({
                        sublistId: 'component',
                        fieldId: 'item',
                        value: component.item
                    });

                    workOrder.setCurrentSublistValue({
                        sublistId: 'component',
                        fieldId: 'quantity',
                        value: component.quantity
                    });

                    workOrder.commitLine({
                        sublistId: 'component'
                    });
                });

                // Save the Work Order
                const workOrderId = workOrder.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                // Return the created Work Order details
                return {
                    success: true,
                    workOrderId: workOrderId,
                    status: 'Planned'
                };

            } catch (e) {
                log.error('Work Order Creation Error', e);
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