var express = require('express');
var app = express();
const cors = require('cors');
const hubspot = require('@hubspot/api-client')
const hubspotClient = new hubspot.Client({ "accessToken": 'pat-na1-1c30f18f-2e97-440a-85c4-a889ce4befc3' })
app.use(express.json());
app.use(cors({
  origin: '*'
}));

app.get('/meetings', async function (req, res) {
  const limit = 6;
  const after = req && req.query.after ? req.query.after : undefined;
  const properties = ['hs_meeting_body', 'hs_meeting_title', 'hs_body_preview_html','hubspot_owner_id','hs_meeting_start_time'];
  const propertiesWithHistory = undefined;
  const associations = undefined;
  const archived = false;

  try {
    const apiResponse = await hubspotClient.crm.objects.meetings.basicApi.getPage(limit, after, properties, propertiesWithHistory, associations, archived);
    const json = JSON.stringify(apiResponse, null, 2);
    const prepaidData = await JSON.parse(json);
    const data = await Promise.all(prepaidData.results.map(async ele=>{
    const apiResponse = await hubspotClient.crm.owners.ownersApi.getById(ele.properties.hubspot_owner_id, "id", false);
      return ele.properties['owner_details'] =apiResponse;
    }));
    res.send(prepaidData)
  } catch (e) {
    e.message === 'HTTP request failed'
      ? res.send(JSON.stringify(e.response, null, 2))
      : res.send(e)
  }

});

app.post('/meetings', async function (req, res) {
  const properties = req.body;
  const SimplePublicObjectInputForCreate = { properties, associations: [{"to":{"id":"101"},"types":[{"associationCategory":"HUBSPOT_DEFINED","associationTypeId":2}]}] };
  try {
    const apiResponse = await hubspotClient.crm.objects.meetings.basicApi.create(SimplePublicObjectInputForCreate);
    console.log(JSON.stringify(apiResponse, null, 2));
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
  
  });
  

app.get('/meetings/id', async function (req, res) {
  const response = await hubspotClient.apiRequest({
    method: 'get',
    path: '/crm/v3/objects/meetings',
  })
  const json = await response.json()
  res.send(json);
});

app.patch('/meetings/:id', async function (req, res) {
  const properties = req.body;
  const SimplePublicObjectInput = { properties };
  const meetingId = req.params.id;
  const idProperty = undefined;

  try {
    const apiResponse = await hubspotClient.crm.objects.meetings.basicApi.update(meetingId, SimplePublicObjectInput, idProperty);
    res.send(JSON.stringify(apiResponse, null, 2));
  } catch (e) {
    e.message === 'HTTP request failed'
      ? res.send(JSON.stringify(e.response, null, 2))
      : res.send(e)
  }
});


app.delete('/meetings/:id', async function (req, res) {
  const meetingId =req.params.id;
  try {
    const apiResponse = await hubspotClient.crm.objects.meetings.basicApi.archive(meetingId);
    res.send(JSON.stringify(apiResponse, null, 2));
  } catch (e) {
    e.message === 'HTTP request failed'
      ?  res.send(JSON.stringify(e.response, null, 2))
      :  res.send(e)
  }
}); 

app.post('/meetings/search',async function (req, res) {
  console.log("`${Date.now() - 30 * 60000}`",`${Date.now() - 30 * 60000}`);
  const filter = { propertyName: 'createdAt', operator: 'GT', value: `${Date.now() - 30 * 60000}` }
const PublicObjectSearchRequest = {  filterGroups:[[{"filters":[filter]}]] ,sorts: [JSON.stringify({ propertyName: 'createdAt', direction: 'DESCENDING' })],properties:[ 'hs_meeting_title'],  limit: 100, after: 0 };
try {
  
  const apiResponse = await hubspotClient.crm.objects.meetings.searchApi.doSearch(PublicObjectSearchRequest);
  res.send(JSON.stringify(apiResponse, null, 2));
} catch (e) {
  e.message === 'HTTP request failed'
    ? res.send(JSON.stringify(e.response, null, 2))
    : res.send(e)
}
})

var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
})