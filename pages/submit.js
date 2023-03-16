export default function Submit() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    console.log('params', urlParams);
    return (
        <div>
            Submit Page Here
        </div>
    );
}
