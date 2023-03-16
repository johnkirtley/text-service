export default function Submit() {
    if (typeof window !== 'undefined') {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        console.log('params', urlParams);
    }

    return (
        <div>
            Submit Page Here
        </div>
    );
}
