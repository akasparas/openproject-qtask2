// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {Observable} from 'core-components/../../node_modules/rxjs/Observablep';
import {scopedObservable} from 'core-components/../helpers/angular-rx-utils';
import {WorkPackageResourceInterface} from 'core-components/api/api-v3/hal-resources/work-package-resource.service';
import {HalResource} from 'core-components/api/api-v3/hal-resources/hal-resource.service';
import {opApiModule} from 'core-components/angular-modules';
import {WorkPackageNotificationService} from 'core-components/wp-edit/wp-notification.service';
import {WorkPackageCreateService} from 'core-components/wp-create/wp-create.service';
import {WorkPackageEditForm} from 'core-components/wp-edit-form/work-package-edit-form';
import {apiWorkPackages} from 'core-components/api/api-work-packages/api-work-packages.service';
import {WorkPackageEditingService} from 'core-components/wp-edit-form/work-package-editing-service';
import {WorkPackageChangeset} from 'core-components/wp-edit-form/work-package-changeset';
import {WorkPackageCacheService} from 'core-components/work-packages/work-package-cache.service';
import {RootDmService} from 'core-components/api/api-v3/hal-resource-dms/root-dm.service';
import {RootResource} from 'core-components/api/api-v3/hal-resources/root-resource.service';
import {CurrentProjectService} from 'core-components/projects/current-project.service';
import {Duration, Moment} from 'core-components/moment';

export class qtaskMainController {

  public selectedBlock:string|null;
  public form:any;
  public workPackage:WorkPackageResourceInterface;
  public changeset:WorkPackageChangeset;
  public me:HalResource;

  constructor(private $scope:ng.IScope,
              public $element:ng.IAugmentedJQuery,
              $rootScope:ng.IRootScopeService,
              //states:States,
              protected $q:ng.IQService,
              protected $http:ng.IHttpService,
              protected $httpParamSerializerJQLike:ng.IHttpParamSerializerJQLikeService,
              protected I18n:op.I18n,
              protected apiWorkPackages:apiWorkPackages,
              protected wpCreate:WorkPackageCreateService,
              protected $location:ng.ILocationService,
              protected wpEditing:WorkPackageEditingService,
              protected wpCacheService:WorkPackageCacheService,
              protected wpNotificationsService:WorkPackageNotificationService,
              protected RootDm:RootDmService,
              protected currentProject:CurrentProjectService

                // private typeResource:TypeResource

//              wpTableGroupBy:WorkPackageTableGroupByService,
//              wpTableTimeline:WorkPackageTableTimelineService,
//              wpTableColumns:WorkPackageTableColumnsService,
//              wpResizer:WorkPackageResizerService
              ) {

    this.RootDm.load().then((root:RootResource) => {
      if (root.user) {
        this.me = root.user;
      }

      $scope.locale = I18n.locale;

      $scope.projects = { tr_count: -1, available: null};
      $scope.tr_promise = this.apiWorkPackages.availableProjects().then(
        function(tr){
          $scope.projects.tr_count = tr.count;
          $scope.projects.available = tr.elements;
          for (let p in $scope.projects.available) {
            if ($scope.projects.available[p].id == currentProject.id) { // no === because of int vs str.
              $scope.projects.selected = $scope.projects.available[p];
              $scope.$ctrl.onProjectChange();
              break;
            }
          }
        },
        function(){
          alert('No available Projects');
        }
      );
    });
  }

  protected newWorkPackageFromParams(stateParams:any) {
    const type = parseInt(stateParams.type);

    // If there is an open edit for this type, continue it
    const changeset = this.wpEditing.state('new').value;
    if (changeset !== undefined) {
      const changeType = changeset.workPackage.type;

      const hasChanges = !changeset.empty;
      const typeEmpty = (!changeType && !type);
      const typeMatches = (changeType && changeType.idFromLink === type.toString());

      if (hasChanges && (typeEmpty || typeMatches)) {
        return this.$q.when(changeset);
      }
    }

    return this.wpCreate.createNewTypedWorkPackage(stateParams.projectPath, type);
  }

  // public initialize() {
  //     //alert('QtMain.Initialize');
  //     // this.form = apiWorkPackages.createWorkPackage({});
  //     //alert('QtMain.Created');
  //   // this.updateAvailableBlocks();
  // }

  public onSave(){
    this.$http({
      //url: '/projects/medo-project/time_entries',
      url: '/work_packages/' + this.workPackage.id + '/time_entries',
      method: 'POST',
      data: this.$httpParamSerializerJQLike({
        time_entry: {
          // comments: 'No comments',
          spent_on: this.workPackage.startDate,
          hours: moment.duration(this.workPackage.estimatedTime,'hours').asHours()
        },
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html' // nothing else is supported :-( We ignore it anyway
      }
    }).then((result) => {
      console.log('time_entry result');
    }, (err) => {
      console.log('time_entry error');
      console.log(err);
    });
  }

  public onProjectChange() {
    console.log('vykdau onProjectChange()');
    if (this.$scope.projects.selected) {
      console.log('Will be createing in project ' + this.$scope.projects.selected.identifier);
      this.$scope.form = this.apiWorkPackages.emptyCreateForm('', this.$scope.projects.selected.identifier);
      this.$scope.form.then((form:any) => {
        this.$scope.types = form.schema.type.allowedValues;
        for (let p in this.$scope.types) {
          if (this.$scope.types[p].name === 'QTask') {
            this.$scope.selectedType = this.$scope.types[p];
            break;
          }
        }
        this.$scope.statuses = form.schema.status.allowedValues;
        for (let p in this.$scope.statuses) {
          if (this.$scope.statuses[p].name === 'Closed') {
            this.$scope.selectedStatus = this.$scope.statuses[p];
            break;
          }
        }
        for (let f of form.schema.availableAttributes) {
          if (!form.schema[f].required) {
            form.schema[f].writable = false;
          }

        }
      });

      var currentDate = new Date().toISOString().substring(0,10);
      this.newWorkPackageFromParams({projectPath: this.$scope.projects.selected.identifier}) // , type: $scope.selectedType.id })
        .then((changeset:WorkPackageChangeset) => {
          var initValues = {
            status: this.$scope.selectedStatus,
            type: this.$scope.selectedType,
            // subject: 'Test subject',
            // description: {format: 'textile', raw: 'Test _des_ *cri* -ption- ...', html: 'Test <i>des</i><b>crip</b><strike>ption</strike>...'},
            startDate: currentDate,
            dueDate: currentDate,
            estimatedTime: 'PT0.25H',
            responsible: this.me, //{ href: '/api/v3/users/1', title: 'Aš pats'},
            assignee: this.me //{ href: '/api/v3/users/1', title: 'Aš pats'}
          };

          this.$scope.changeset = changeset;
          this.workPackage = changeset.workPackage;
          for (let key in initValues) {
            if (!initValues[key]) continue; //
            this.$scope.changeset.setValue(key, initValues[key]);
            if (typeof initValues[key] === 'object' && 'href' in initValues[key]){
              this.workPackage.$source._links[key]=initValues[key];
              if ('name' in initValues[key] || 'title' in initValues[key]) {
                this.workPackage[key]=initValues[key];
              }
            } else {
              this.workPackage[key]=initValues[key];
            }
          };
          delete this.workPackage.addAttachments;

          this.wpEditing.updateValue('new', changeset);
          this.wpCacheService.updateWorkPackage(changeset.workPackage);
        })
        .catch(error => {
          if (error.errorIdentifier === 'urn:openproject-org:api:v3:errors:MissingPermission') {
            this.RootDm.load().then((root:RootResource) => {
              if (!root.user) {
                // Not logged in
                let url:string = this.$location.absUrl();
                this.$location.path('/login').search({back_url: url});
                let loginUrl:string = this.$location.absUrl();
                window.location.href = loginUrl;
              }
            });
            this.wpNotificationsService.handleErrorResponse(error);
          }
        });
    }
  }


}

function qtaskMain():any {
  return {
    restrict: 'EA',
    scope: {
      //  form: '='
    },
    transclude: true,
    compile: function() {
      return function(
        scope:any,
        element:ng.IAugmentedJQuery,
        attrs:ng.IAttributes,
        ctrls:any
        ,transclude:any
      ) {
        transclude(scope, (clone:any) => {
          element.append(clone);
          // scope.$ctrl.initialize();
         });
      };
    },
    bindToController: true,
    controller: qtaskMainController,
    controllerAs: '$ctrl'
  };
}

angular.module('openproject').directive('qtaskMain', qtaskMain);
