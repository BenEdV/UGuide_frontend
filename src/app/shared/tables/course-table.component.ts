import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@shared/pipes/date.pipe';
import { LoggingService } from 'src/app/core/services/logging.service';
import { ToastService } from 'src/app/core/services/components/toast.service';
import { BaseTableComponent } from './base-table/base-table.component';
import { Collection } from 'src/app/core/interfaces/collection';
import { AuthService } from 'src/app/core/services/auth.service';
import { CollectionStatic } from 'src/app/collections/collection.static';

@Component({
  selector: 'app-course-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class CourseTableComponent extends BaseTableComponent implements OnChanges {
  @Input() collections: Collection[];
  courses: Collection[]; // the collections with a course_instance

  courseRouterLinks = {
    name: (collection: Collection) => {
      const maySeeUserResults = this.authService.checkPermissions(['see_user_results'], collection);
      const route = CollectionStatic.getColectionRoute(maySeeUserResults);
      return ['/', 'collections', collection.id, route];
    }
  };

  courseValueOverrides = {
    name: (collection: Collection) => collection.course_instance.course.name,
    code: (collection: Collection) => collection.course_instance.course.code,
    period: (collection: Collection) => this.datePipe.transform(collection.course_instance.period.start_date)
  };

  // Override @Input() from BaseTableComponent
  data; sliderKey; childKey; sliderMin; sliderMax;

  constructor(private logger: LoggingService,
              private toaster: ToastService,
              private datePipe: DatePipe,
              private authService: AuthService) {
    super(logger, toaster);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.keys) {
      this.keys = ['name', 'code', 'period'];
    }

    this.courses = this.collections.filter(collection => collection.course_instance);

    this.injectDefaults(this.valueOverrides, this.courseValueOverrides);
    this.injectDefaults(this.routerLinks, this.courseRouterLinks);

    this.data = this.courses;
    super.ngOnChanges(changes);
  }

}
