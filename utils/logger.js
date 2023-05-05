/**
@param {string} type - action or error
@param {string} message - describe action or error
@param {any} misc - any additional info such as error message response or user id
*/

const logger = async (type, message, misc) => {
    const url = process.env.NEXT_PUBLIC_LOGGER;

    let status;

    if (type === 'error') {
        const error = {
            message,
            error: misc,
        };

        const response = await fetch(`${url}/error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error }),
        });

        await response.json();

        if (response.ok) {
            status = 'Log Sent';
        } else {
            status = 'Error sending log';
        }
    }

    if (type === 'action') {
        const action = {
            message,
            data: misc,
        };

        const response = await fetch(`${url}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
        });

        await response.json();

        if (response.ok) {
            status = 'Log Sent';
        } else {
            status = 'Error sending log';
        }
    }

    return status;
};

export default logger;
