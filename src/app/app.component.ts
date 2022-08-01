import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { ZoomMtg } from '@zoomus/websdk';

ZoomMtg.setZoomJSLib('https://source.zoom.us/2.5.0/lib', '/av');

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US');
ZoomMtg.i18n.reload('en-US');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // setup your signature endpoint here: https://github.com/zoom/meetingsdk-sample-signature-node.js
  signatureEndpoint = 'http://localhost:9000/v1/live_kit/zoom';
  // This Sample App has been updated to use SDK App type credentials https://marketplace.zoom.us/docs/guides/build/sdk-app
  sdkKey = '21QeFnp6Pz4vRTHsQuN9h0Z0lY3qORiuVCi9';
  meetingNumber = '123456789';
  role = 0;
  leaveUrl = 'http://localhost:4200';
  userName = 'Angular';
  userEmail = '';
  passWord = '';
  // pass in the registrant's token if your meeting or webinar requires registration. More info here:
  // Meetings: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/meetings#join-registered
  // Webinars: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/webinars#join-registered
  registrantToken = '';
  hostEmail: string = 'gaurav.gupta1@pw.live';
  hostName = 'host';
  panelistEmail: string = '8318215746@pw.live';
  panelistName = 'panelist';
  attendeeEmail: string = 'attendee@pw.live';
  attendeeName = 'attendee';
  joinType: 'host' | 'panelist' | 'attendee';
  zak: string = '';

  constructor(public httpClient: HttpClient, @Inject(DOCUMENT) document) {
    this.httpClient
      .get(`${this.signatureEndpoint}/get-zak`, {
        params: new HttpParams().append('email', this.hostEmail),
      })
      .subscribe((res: any) => {
        this.zak = res.data.token;
      });
  }

  ngOnInit() {}
  createWebinar() {
    this.joinType = 'host';
    this.httpClient
      .get(`${this.signatureEndpoint}/webinar-list`, {
        params: new HttpParams().append('email', this.hostEmail),
      })
      .subscribe((res: any) => {
        this.role = 1;
        if (res?.data?.webinars?.length) {
          this.getSignature(
            1,
            res?.data?.webinars[0]?.id,
            this.hostName,
            this.hostEmail,
            this.zak
          );
        } else {
          this.httpClient
            .post(`${this.signatureEndpoint}/create-webinar`, {
              email: this.hostEmail,
            })
            .subscribe((res: any) => {
              this.getSignature(
                1,
                res?.data?.id,
                this.hostName,
                this.hostEmail,
                this.zak
              );
            });
        }
      });
  }

  panelistJoin() {
    this.httpClient
      .get(`${this.signatureEndpoint}/webinar-list`, {
        params: new HttpParams().append('email', this.hostEmail),
      })
      .subscribe((res: any) => {
        const webId = res?.data?.webinars[0]?.id;
        // this.httpClient.post(`${this.signatureEndpoint}/add-panelist`, {
        //   webinar_id: webId,
        //   email: this.panelistEmail,
        //   name: this.panelistName,
        // }).subscribe(result => {
        this.role = 0;
        this.getSignaturePanelist(0, webId, this.panelistName, this.panelistEmail, '');
        // })
      });
  }

  getSignature(
    role: number,
    meetingNumber: string,
    userName: string,
    email: string,
    zak: string
  ) {
    this.httpClient
      .post(this.signatureEndpoint, {
        meetingNumber: meetingNumber,
        role: role,
      })
      .toPromise()
      .then((data: any) => {
        if (data?.data?.signature) {
          console.log(data.data.signature);
          this.startMeeting(
            data.data.signature,
            meetingNumber,
            userName,
            email,
            zak
          );
        } else {
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  getSignaturePanelist(
    role: number,
    meetingNumber: string,
    userName: string,
    email: string,
    zak: string
  ) {
    this.httpClient
      .post(this.signatureEndpoint, {
        meetingNumber: meetingNumber,
        role: role,
      })
      .toPromise()
      .then((data: any) => {
        if (data?.data?.signature) {
          console.log(data.data.signature);
          this.startMeetingPanelist(
            data.data.signature,
            meetingNumber,
            userName,
            email,
            zak
          );
        } else {
          console.log(data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  startMeeting(signature, meetingNumber, userName, email, zak) {
    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      success: (success) => {
        console.log(success);
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: this.sdkKey,
          userEmail: email,
          passWord: this.passWord,
          // tk: this.registrantToken,
          ...(this.role === 1 ? { zak: zak } : undefined),
          success: (success) => {
            console.log(success);
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  startMeetingPanelist(signature, meetingNumber, userName, email, zak) {
    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      success: (success) => {
        console.log(success);
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: this.sdkKey,
          userEmail: email,
          passWord: this.passWord,
          tk: '97384680167?tk=cK1s4SG86SzO_nRwU62WLqPVgsu3TAoMA4POiOrG-ms.DQMAAAAWrJRK5xZ3RDk2Zm1jcFF2T3hQem93VTZqOVVRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          ...(this.role === 1 ? { zak: zak } : undefined),
          success: (success) => {
            console.log(success);
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
