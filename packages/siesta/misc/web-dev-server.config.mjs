export default {
    plugins : [
        {
            name : 'allow-cors',
            transform (context) {
                context.response.set('Access-Control-Allow-Origin', '*')
            },
        },
    ],
};
