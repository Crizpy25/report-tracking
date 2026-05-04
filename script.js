const supabaseClient = supabase.createClient(
  "https://zjedyulcrxcttbukbynh.supabase.co",
  "sb_publishable_O4_Gy_uk6L50ARMA8QnP1g_QEAS2lJJ"
);

let selectedFile = null;

// IMAGE PREVIEW
document.getElementById("imageInput").addEventListener("change", (e) => {
  selectedFile = e.target.files[0];

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById("preview");
      img.src = e.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(selectedFile);
  }
});

// GET LOCATION
function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      err => reject(err)
    );
  });
}

// UPLOAD IMAGE
async function uploadImage(file) {
  const fileName = `reports/${Date.now()}.jpg`;

  const { error } = await supabaseClient.storage
    .from('report-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from('report-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// SEND REPORT
async function sendReport() {
  const status = document.getElementById("status");

  try {
    status.innerText = "Getting location...";
    const loc = await getLocation();

    status.innerText = "Uploading...";
    let imageUrl = "";

    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile);
    }

    status.innerText = "Sending...";

    await supabaseClient.from('incidents').insert({
      device_id: Date.now().toString(),
      category: document.getElementById("category").value,
      description: document.getElementById("description").value,
      latitude: loc.latitude,
      longitude: loc.longitude,
      status: "active",
      image_url: imageUrl
    });

    status.innerText = "Sent successfully!";
    document.getElementById("description").value = "";
    document.getElementById("preview").style.display = "none";

  } catch (err) {
    status.innerText = "Error: " + err.message;
  }
}

// BUTTON EVENT (✅ FIXED - no onclick error)
document.getElementById("sendBtn").addEventListener("click", sendReport);