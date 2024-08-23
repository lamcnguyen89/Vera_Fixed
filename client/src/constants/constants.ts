const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
)

export default {
  // prod creds
  ClientIdentifier: '4ff907906e501f6073ca5d31e8074df6ad1587f5',
  ClientSecret: '/T/3C2J5m9/Kmf4J6GfqSOySLhV6ipB0atB1yxdlmk17Xbi8skUMnF9m12knEdMa1qsxm/Gglr+qsm0NkR/etwmqV1XsLjdLz13ticeaqoyw73ugoGclkrFRN+kjA+5M',

  // test creds
  //   ClientIdentifier: "ee3bb62e77be08ffcc861d5d7cbeb2f7cc9fe9e0",
  //   ClientSecret: "wrw0xf0g2iFbzrp3cNeiuSBbhQhF+q6z4WgzcG08SV2IfBp0KjqEKBdLLmWHLfvO9lVrjL5sQksVPqA2ytDbtDPhidrMs/gV6Kgjr5wd/WAosl9N7+N4xjDIMcS5YxPh",
  localVimeoRedirectUri: `${process.env.REACT_APP_PROTOCOL}://${window.location.hostname}${isLocalhost ? ":3000" : ""}/receiveVimeoToken`
}
