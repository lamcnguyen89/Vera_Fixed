/* eslint-disable no-useless-escape */
export default {

  // ----------------- protoelements ------------------- //
  getNumberOfProtoScenes: function () {
    return (
      `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#>
      select ?s 
      where{
        ?s ?p ice:ProtoScene
      }
      ORDER BY ASC(?s)`
    )
  },

  addProtoScene: function (newScene, description) {
    return (
      `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
      PREFIX owl: <http://www.w3.org/2002/07/owl#> 
      PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
      INSERT DATA {
        :${newScene} <rdf:type> ice:ProtoScene, <owl:NamedIndividual> ; ice:hasDescription \"${description}${`\" .
      }`}`
    )
  },

  getAllProtoScenes: function () {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            SELECT ?sub ?pred ?obj WHERE {
              ?sub ?pred ice:ProtoScene .
              ?sub ice:hasDescription ?obj .
            } `
  },

  deleteProtoScene: function (ProtoScene) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 

            Delete
            Where{
              :S` + ProtoScene + ` ?p ?o
            } ;
            Delete
            Where{
              ?s ?p :S` + ProtoScene + `
            } ;
            Delete {?s ?p ?o }
            Where{
              ?s ?p ?o .FILTER regex(str(?s), "_S` + ProtoScene + `")
            } ;`
  },

  getNumberOfProtoBeats: function () {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#>
      select ?s 
      where{
        ?s ?p ice:ProtoBeat
      }
      ORDER BY ASC(?s)`
  },

  addProtoBeat: function (newBeat, description) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            INSERT DATA {
              :` + newBeat + ' <rdf:type> ice:ProtoBeat, <owl:NamedIndividual> ; ice:hasDescription \"' + description + `\" .
            }`
  },

  getAllProtoBeats: function () {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            SELECT ?sub ?pred ?obj WHERE {
              ?sub ?pred ice:ProtoBeat .
              ?sub ice:hasDescription ?obj .
            }`
  },

  deleteProtoBeat: function (ProtoBeat) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 

            Delete
            Where{
              :B` + ProtoBeat + ` ?o ?p
            } ;
            Delete
            Where{
              ?s ?o :B` + ProtoBeat + `
            } ;
            Delete {?s ?p ?o }
            Where{
              ?s ?p ?o .FILTER regex(str(?s), "_B` + ProtoBeat + `")
            }`
  },

  getNumberOfProtoChoices: function () {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#>
            select ?s 
      where{
        ?s ?p ice:ProtoChoice
      }
      ORDER BY ASC(?s)`
  },

  addProtoChoice: function (newChoice, description) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            INSERT DATA {
              :` + newChoice + ' <rdf:type> ice:ProtoChoice, <owl:NamedIndividual> ; ice:hasDescription \"' + description + `\" .
            }`
  },

  getAllProtoChoices: function () {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            SELECT ?sub ?pred ?obj WHERE {
              ?sub ?pred ice:ProtoChoice .
              ?sub ice:hasDescription ?obj .
            }`
  },

  deleteProtoChoice: function (ProtoChoice) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 

            Delete
            Where{
              :C` + ProtoChoice + ` ?o ?p
            } ;
            Delete
            Where{
              ?s ?o :C` + ProtoChoice + `
            } ;
            Delete {?s ?p ?o }
            Where{
              ?s ?p ?o .FILTER regex(str(?s), "_C` + ProtoChoice + `")
            }`
  },

  // ----------------- segments ------------------- //

  addScene: function (testSubject, frame1, frame2, protoScene) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            PREFIX time: <http://www.w3.org/2006/time#> 
            INSERT DATA { 
              :P` + testSubject + '_F' + frame1 + ' <rdf:type> ice:Frame, <owl:NamedIndividual> ; time:numericPosition ' + frame1 + ` .
              :P` + testSubject + '_F' + frame2 + ' <rdf:type> ice:Frame, <owl:NamedIndividual> ; time:numericPosition ' + frame2 + ` . 
              :P` + testSubject + '_S' + protoScene + ' <rdf:type> ice:Scene, <owl:NamedIndividual> ; time:hasBeginning :P' + testSubject + '_F' + frame1 + ' ; time:hasEnd :P' + testSubject + '_F' + frame2 + ' ; ice:instanceOf :S' + protoScene + ` . 
            }`
  },

  getAllScenesPerSubject: function (testSubject) {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            PREFIX time: <http://www.w3.org/2006/time#>
            SELECT ?s ?p ?o  
            WHERE { 
              ?s <http://www.w3.org/2006/time#hasBeginning>|<http://www.w3.org/2006/time#hasEnd> ?o .FILTER regex(str(?s), "http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#P` + testSubject + `_S").
            }
            ORDER BY ?s ?o`
  },

  deleteScenePerSubject: function (testSubject, Scene) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 

            Delete
            Where{
              :P` + testSubject + '_S' + Scene + ` ?o ?p
            } ;
            Delete
            Where{
              ?s ?o :P` + testSubject + '_S' + Scene + `
            }`
  },

  addBeat: function (testSubject, frame1, frame2, protoBeat) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            PREFIX time: <http://www.w3.org/2006/time#> 
            INSERT DATA { 
              :P` + testSubject + '_F' + frame1 + ' <rdf:type> ice:Frame, <owl:NamedIndividual> ; time:numericPosition ' + frame1 + ` .
              :P` + testSubject + '_F' + frame2 + ' <rdf:type> ice:Frame, <owl:NamedIndividual> ; time:numericPosition ' + frame2 + ` . 
              :P` + testSubject + '_B' + protoBeat + ' <rdf:type> ice:Scene, <owl:NamedIndividual> ; time:hasBeginning :P' + testSubject + '_F' + frame1 + ' ; time:hasEnd :P' + testSubject + '_F' + frame2 + ' ; ice:instanceOf :B' + protoBeat + ` . 
            }`
  },

  getAllBeatsPerSubject: function (testSubject) {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            PREFIX time: <http://www.w3.org/2006/time#>
            SELECT ?s ?p ?o  
            WHERE { 
              ?s <http://www.w3.org/2006/time#hasBeginning>|<http://www.w3.org/2006/time#hasEnd> ?o .FILTER regex(str(?s), "http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#P` + testSubject + `_B").
            }
            ORDER BY ?s ?o`
  },

  deleteBeatPerSubject: function (testSubject, beat) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 

            Delete
            Where{
              :P` + testSubject + '_B' + beat + ` ?o ?p
            } ;
            Delete
            Where{
              ?s ?o :P` + testSubject + '_B' + beat + `
            }`
  },

  // ----------------- self reports ------------------- //

  addChoice: function (testSubject, frame1, protoChoice) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            PREFIX time: <http://www.w3.org/2006/time#> 
            INSERT DATA { 
              :P` + testSubject + '_F' + frame1 + ' <rdf:type> ice:Frame, <owl:NamedIndividual> ; time:numericPosition ' + frame1 + ` .
              :P` + testSubject + '_C' + protoChoice + ' <rdf:type> ice:Choice, <owl:NamedIndividual> ; time:hasBeginning :P' + testSubject + '_F' + frame1 + ' ;  ice:instanceOf :B' + protoChoice + ` . 
            }`
  },

  getAllChoicesPerSubject: function (testSubject) {
    return `PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 
            PREFIX time: <http://www.w3.org/2006/time#>
            SELECT ?s ?p ?o  
            WHERE { 
              ?s <http://www.w3.org/2006/time#hasBeginning> ?o .FILTER regex(str(?s), "http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#P` + testSubject + `_C").
            }
            ORDER BY ?s ?o`
  },

  deleteChoicePerSubject: function (testSubject, choice) {
    return `PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#> 
            PREFIX owl: <http://www.w3.org/2002/07/owl#> 
            PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#> 

            Delete
            Where{
              :P` + testSubject + '_C' + choice + ` ?o ?p
            } ;
            Delete
            Where{
              ?s ?o :P` + testSubject + '_C' + choice + `
            }`
  }

}
