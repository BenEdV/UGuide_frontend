import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidenavService } from 'src/app/core/services/components/sidenav.service';

@Component({
  selector: 'app-tab-test',
  templateUrl: './tab-test.component.html',
  styleUrls: ['./tab-test.component.scss']
})
export class TabTestComponent implements OnInit {

  constructor(private route: ActivatedRoute, private sidenavService: SidenavService) { }

  ngOnInit() { }

  addTab() {
    const rando = Math.round(Math.random() * 100);
    let link = '';
    if (rando < 20) {
      link = 'table';
    } else if (rando < 40) {
      link = 'chart';
    } else if (rando < 60) {
      link = 'permission-test';
    } else {
      link = '';
    }

    this.sidenavService.addTab('exams.overview', rando.toString(), ['test', link], this.route.snapshot.data.collection);
  }

}
