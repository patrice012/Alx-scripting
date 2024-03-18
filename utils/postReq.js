async function postRequest(url, data) {
  try {
    const response = await fetch(`http://localhost:5000${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

module.exports = postRequest;
