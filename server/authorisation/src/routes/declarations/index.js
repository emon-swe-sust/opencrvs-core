/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-20 22:57:36
 */

const Joi = require('joi');

exports.register = (server, options, next) => {

    server.route({

        path: '/declarations',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve declarations.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./get')
    });

    server.route({

        path: '/declarations',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a declaration.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                payload: {
                    status: Joi.string(),
                    motherDetails: Joi.string(),
                    uuid: Joi.string(),
                    code: Joi.string(),
                    tracking: Joi.string(),
                    motherDetails: Joi.number(),
                    fatherDetails: Joi.number(),
                    childDetails: Joi.number()
                }
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/declarations/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a declaration.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                params: {
                    status: Joi.string(),
                    id: Joi.number()
                }
            }
        },
        handler: require('./put')
    });

    server.route({

        path: '/declarations/{id}',
        method: 'DELETE',
        config: {
            auth: 'jwt',
            description: 'Protected route to delete a declaration.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./delete')
    });

    next();
};

exports.register.attributes = {
    name: 'declaration-routes'
};